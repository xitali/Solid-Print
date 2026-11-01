/// <reference lib="webworker" />
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Mesh,BufferGeometry,Object3D } from 'three'
const LIMIT=500000
self.onmessage=async(event:MessageEvent<{buffer:ArrayBuffer;ext:string}>)=>{
 try{
  const {buffer,ext}=event.data;let root:Object3D|undefined;let simple:BufferGeometry|undefined
  if(ext==='stl')simple=new STLLoader().parse(buffer)
  if(ext==='obj')root=new OBJLoader().parse(new TextDecoder().decode(buffer))
  if(ext==='glb'){
    const view=new DataView(buffer)
    if(buffer.byteLength<20||view.getUint32(0,true)!==0x46546c67)throw new Error('Nieprawidłowy plik GLB.')
    const length=view.getUint32(12,true);if(length>buffer.byteLength-20)throw new Error('Niekompletny plik GLB.')
    const json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length)))
    if(json.images?.length||json.buffers?.some((b:{uri?:string})=>b.uri))throw new Error('Ten model zawiera tekstury lub zewnętrzne zasoby. Prześlij plik do ręcznej oceny.')
    root=(await new GLTFLoader().parseAsync(buffer,'')).scene
  }
  const arrays:Float32Array[]=[];let triangles=0
  function add(g:BufferGeometry){const count=(g.index?.count||g.getAttribute('position')?.count||0)/3;triangles+=count;if(triangles>LIMIT)throw new Error('Model jest zbyt złożony do podglądu. Możesz nadal przesłać plik.');const normalized=g.index?g.toNonIndexed():g;const attr=normalized.getAttribute('position');if(!attr)return;arrays.push(new Float32Array(attr.array))}
  if(simple)add(simple)
  if(root){root.updateMatrixWorld(true);root.traverse(obj=>{if(obj instanceof Mesh){const geometry=obj.geometry.clone();geometry.applyMatrix4(obj.matrixWorld);add(geometry)}})}
  if(!triangles)throw new Error('Nie znaleziono powierzchni modelu. Możesz nadal przesłać plik.')
  const out=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;for(const a of arrays){out.set(a,offset);offset+=a.length}
  self.postMessage({positions:out.buffer},[out.buffer])
 }catch(e){self.postMessage({error:e instanceof Error?e.message:'Nie udało się odczytać modelu. Możesz nadal przesłać plik.'})}
}
