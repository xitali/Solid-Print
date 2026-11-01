'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Box } from 'lucide-react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function ModelPreview({ file }: { file: File }) {
  const mount = useRef<HTMLDivElement>(null)
  const reset = useRef<() => void>(() => {})
  const [message, setMessage] = useState('Odczytywanie geometrii modelu…')

  useEffect(() => {
    let disposed = false
    let renderer: THREE.WebGLRenderer | undefined
    let geometry: THREE.BufferGeometry | undefined
    let material: THREE.MeshStandardMaterial | undefined
    let controls: OrbitControls | undefined
    let observer: ResizeObserver | undefined
    let visObserver: IntersectionObserver | undefined

    const worker = new Worker(new URL('../workers/model-parser.ts', import.meta.url), { type: 'module' })
    const timer = setTimeout(() => {
      worker.terminate()
      if (!disposed) setMessage('Podgląd trwał zbyt długo. Możesz nadal przesłać plik do wyceny.')
    }, 12000)

    worker.onerror = () => {
      clearTimeout(timer)
      setMessage('Podgląd jest niedostępny. Możesz nadal przesłać plik.')
    }

    worker.onmessage = (event: MessageEvent) => {
      clearTimeout(timer)
      if (disposed) return
      if (event.data.error) {
        setMessage(event.data.error)
        return
      }
      try {
        const element = mount.current!
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#1C1B19')
        const camera = new THREE.PerspectiveCamera(38, element.clientWidth / element.clientHeight, 0.01, 100)

        geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(event.data.positions), 3))
        geometry.computeVertexNormals()
        geometry.computeBoundingBox()
        geometry.center()

        const box = geometry.boundingBox!
        const size = new THREE.Vector3()
        box.getSize(size)
        const scale = 2 / Math.max(size.x, size.y, size.z, 0.001)
        geometry.scale(scale, scale, scale)

        material = new THREE.MeshStandardMaterial({
          color: 0xc2410c,
          roughness: 0.45,
          metalness: 0.15,
          side: THREE.DoubleSide,
        })
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        scene.add(new THREE.HemisphereLight(0xffffff, 0x2b2824, 2.5))
        const light = new THREE.DirectionalLight(0xffffff, 3.2)
        light.position.set(3, 5, 4)
        scene.add(light)

        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
        element.appendChild(renderer.domElement)

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.enablePan = false
        controls.minDistance = 2
        controls.maxDistance = 9

        reset.current = () => {
          camera.position.set(3, 2.5, 4)
          controls!.target.set(0, 0, 0)
          controls!.update()
        }
        reset.current()

        observer = new ResizeObserver(() => {
          if (!renderer) return
          renderer.setSize(element.clientWidth, element.clientHeight)
          camera.aspect = element.clientWidth / element.clientHeight
          camera.updateProjectionMatrix()
        })
        observer.observe(element)
        renderer.setSize(element.clientWidth, element.clientHeight)

        // Slicer layer-scan animation (Item E5) & Battery-saver offscreen pause (Item E6)
        const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const ext = file.name.split('.').pop()?.toLowerCase() || 'stl'
        const up: 'y' | 'z' = ext === 'stl' ? 'z' : 'y'
        const half = ((up === 'z' ? size.z : size.y) * scale) / 2 + 0.05
        const plane = new THREE.Plane(up === 'z' ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, -1, 0), -half)
        let sliceDone = reduce
        let scan: THREE.Mesh | undefined

        if (!reduce) {
          renderer.localClippingEnabled = true
          material.clippingPlanes = [plane]
          scan = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshBasicMaterial({
              color: 0xff8a5b,
              transparent: true,
              opacity: 0.22,
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          )
          if (up === 'y') scan.rotation.x = -Math.PI / 2
          scene.add(scan)
        }

        let inView = true
        visObserver = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting
          },
          { threshold: 0.05 }
        )
        visObserver.observe(element)

        const t0 = performance.now()
        renderer.setAnimationLoop(() => {
          if (!inView || document.hidden) return
          if (!sliceDone && scan && material) {
            const k = Math.min(1, (performance.now() - t0) / 2400)
            const c = -half + k * 2 * half
            plane.constant = c
            scan.position[up] = c
            if (k >= 1) {
              material.clippingPlanes = []
              material.needsUpdate = true
              scene.remove(scan)
              sliceDone = true
            }
          }
          controls?.update()
          renderer?.render(scene, camera)
        })

        setMessage('')
      } catch {
        setMessage('Twoje urządzenie nie obsługuje tego podglądu. Możesz nadal przesłać plik.')
      }
    }

    file.arrayBuffer().then((buffer) => {
      if (!disposed) {
        worker.postMessage({ buffer, ext: file.name.split('.').pop()?.toLowerCase() }, [buffer])
      }
    })

    return () => {
      disposed = true
      clearTimeout(timer)
      worker.terminate()
      observer?.disconnect()
      visObserver?.disconnect()
      controls?.dispose()
      renderer?.setAnimationLoop(null)
      renderer?.dispose()
      renderer?.domElement.remove()
      geometry?.dispose()
      material?.dispose()
    }
  }, [file])

  return (
    <div className="model-preview">
      <div ref={mount} style={{ position: 'absolute', inset: 0 }} />
      <span className="preview-label">PODGLĄD / {file.name}</span>
      {message ? (
        <div className="preview-message" role="status">
          <Box size={30} strokeWidth={1} />
          {message}
        </div>
      ) : (
        <>
          <span className="preview-help">Przeciągnij, aby obrócić. Powiększ palcami lub kółkiem myszy.</span>
          <div className="preview-controls">
            <button type="button" onClick={() => reset.current()}>
              <RotateCcw size={14} />
              Przywróć widok
            </button>
          </div>
        </>
      )}
    </div>
  )
}
