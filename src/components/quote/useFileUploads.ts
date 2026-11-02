import { SubmissionError, type SubmissionSession, type UploadItem } from '@/lib/submission'

type UploadPatch={status?:'uploading'|'done'|'error';progress?:number;serverId?:number}
export function useFileUploads(patchFile:(id:string,patch:UploadPatch)=>void){
  async function upload(file: UploadItem, serverId: number, auth: SubmissionSession) {
    patchFile(file.id, { status: 'uploading', progress: 0, serverId })
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', `/api/quote/files/${serverId}`)
      xhr.setRequestHeader('x-upload-token', auth.token)
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      xhr.timeout = 5 * 60 * 1000

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          patchFile(file.id, { progress: Math.round((e.loaded / e.total) * 100) })
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          patchFile(file.id, { status: 'done', progress: 100 })
          resolve()
        } else {
          let message = 'Nie udało się przesłać pliku.'
          let code: string | undefined
          try {
            const result = JSON.parse(xhr.responseText)
            message = result.error || message
            code = result.code
          } catch {}
          patchFile(file.id, { status: 'error' })
          reject(new SubmissionError(`${file.file.name}: ${message}`, code))
        }
      }
      xhr.onerror = () => {
        patchFile(file.id, { status: 'error' })
        reject(new Error('Połączenie zostało przerwane. Wyślij zapytanie ponownie, aby wznowić.'))
      }
      xhr.ontimeout = () => {
        patchFile(file.id, { status: 'error' })
        reject(new Error('Przesyłanie trwało zbyt długo. Spróbuj ponownie.'))
      }
      xhr.send(file.file)
    })
  }

  return upload
}
