import { mkdir,writeFile } from 'node:fs/promises'
await mkdir('.data/qa',{recursive:true})
const triangles=[[0,0,0,40,0,0,0,40,0],[0,0,0,0,0,40,40,0,0],[0,0,0,0,40,0,0,0,40],[40,0,0,0,0,40,0,40,0]]
const stl='solid tetra\n'+triangles.map(t=>'facet normal 0 0 0\nouter loop\n'+[0,3,6].map(i=>`vertex ${t[i]} ${t[i+1]} ${t[i+2]}`).join('\n')+'\nendloop\nendfacet').join('\n')+'\nendsolid tetra\n'
await writeFile('.data/qa/model.stl',stl)
await writeFile('.data/qa/model.obj','v 0 0 0\nv 40 0 0\nv 0 40 0\nv 0 0 40\nf 1 2 3\nf 1 4 2\nf 1 3 4\nf 2 4 3\n')
const positions=new Float32Array(triangles.flat());const binary=Buffer.from(positions.buffer)
const json=Buffer.from(JSON.stringify({asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{byteLength:binary.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:binary.length,target:34962}],accessors:[{bufferView:0,componentType:5126,count:12,type:'VEC3',min:[0,0,0],max:[40,40,40]}]}))
const paddedJson=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)])
const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+paddedJson.length+8+binary.length,8)
const jsonHeader=Buffer.alloc(8);jsonHeader.writeUInt32LE(paddedJson.length,0);jsonHeader.writeUInt32LE(0x4e4f534a,4)
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binary.length,0);binHeader.writeUInt32LE(0x004e4942,4)
await writeFile('.data/qa/model.glb',Buffer.concat([header,jsonHeader,paddedJson,binHeader,binary]))
console.log('Utworzono lokalne modele testowe STL, OBJ i GLB.')
