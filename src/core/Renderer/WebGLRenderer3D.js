/* ===================================================================== *
 *  src/Renderer/WebGLRenderer3D.js
 * ===================================================================== */

import { Renderer } from './Renderer.js';
import { mat4 }     from '../../vendor/gl-matrix/index.js';

export class WebGLRenderer3D extends Renderer {
  constructor(graphicalContext, backgroundColor) {
    super(graphicalContext.getContext(), backgroundColor);

    this.canvas = graphicalContext.getCanvas();
    this.gl     = graphicalContext.getContext();

    /* орбитальная камера */
    this.camYaw   =  0;
    this.camPitch = -0.6;
    this.camDist  =  6;
    this._drag    = null;

    /* сетка */
    this.gridSize = 10;
    this.gridStep = 1;

    this._initWebGL(backgroundColor);
    this._initShaders();
    this._setupProjection();
    this._attachControls();
  }

  /* ---------- low-level -------------------------------------------------- */

  _initWebGL(bg) {
    const [r,g,b] = typeof bg === 'string'
      ? this._hexToRGB(bg) : bg;
    const gl = this.gl;
    gl.clearColor(r,g,b,1);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
  }
  _hexToRGB(hex) { const n=parseInt(hex.slice(1),16);
    return [(n>>16)/255,((n>>8)&255)/255,(n&255)/255]; }
  _loadShader(t,s){const gl=this.gl,sh=gl.createShader(t);
    gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}

  /* ---------- шейдер  ---------------------------------------------------- */

  _initShaders() {
    const v=`
      attribute vec3 aVertexPosition;
      uniform mat4 uModel,uView,uProjection;
      void main(){gl_Position=uProjection*uView*uModel*
                 vec4(aVertexPosition,1.0);} `;
    const f=`
      precision mediump float;
      uniform vec4 uColor;
      void main(){gl_FragColor=uColor;}`;
    const gl=this.gl;
    const vs=this._loadShader(gl.VERTEX_SHADER,v);
    const fs=this._loadShader(gl.FRAGMENT_SHADER,f);
    this.shaderProgram=gl.createProgram();
    gl.attachShader(this.shaderProgram,vs);
    gl.attachShader(this.shaderProgram,fs);
    gl.linkProgram(this.shaderProgram);
    gl.useProgram(this.shaderProgram);

    this.uModel =gl.getUniformLocation(this.shaderProgram,'uModel');
    this.uView  =gl.getUniformLocation(this.shaderProgram,'uView');
    this.uProj  =gl.getUniformLocation(this.shaderProgram,'uProjection');
    this.uColor =gl.getUniformLocation(this.shaderProgram,'uColor');
    this.aPos   =gl.getAttribLocation (this.shaderProgram,'aVertexPosition');
    gl.enableVertexAttribArray(this.aPos);
  }

  _setupProjection(){
    const proj=mat4.create();
    mat4.perspective(proj,Math.PI/4,
      this.canvas.width/this.canvas.height,0.1,100);
    this.gl.uniformMatrix4fv(this.uProj,false,proj);
  }

  /* ---------- input ------------------------------------------------------ */

  _attachControls(){
    this.canvas.addEventListener('mousedown',e=>{
      if(e.button===0) this._drag={x:e.clientX,y:e.clientY};
    });
    window.addEventListener('mousemove',e=>{
      if(!this._drag) return;
      const dx=e.clientX-this._drag.x,dy=e.clientY-this._drag.y;
      this._drag={x:e.clientX,y:e.clientY};
      this.camYaw+=dx*0.005;
      this.camPitch+=dy*0.005;
      this.camPitch=Math.max(-1.55,Math.min(1.55,this.camPitch));
    });
    window.addEventListener('mouseup',()=>this._drag=null);
    this.canvas.addEventListener('wheel',e=>{
      e.preventDefault();
      this.camDist*=e.deltaY>0?1.1:0.9;
      this.camDist=Math.min(Math.max(this.camDist,1),50);
    });
    window.addEventListener('keydown',e=>{
      switch(e.key){
        case '+':case'=':this.gridSize=Math.min(this.gridSize+1,50);break;
        case '-':case'_':this.gridSize=Math.max(this.gridSize-1,1);break;
        case ']':        this.gridStep=Math.min(this.gridStep+1,10);break;
        case '[':        this.gridStep=Math.max(this.gridStep-1,1);break;
      }
    });
  }

  /* ---------- helpers ---------------------------------------------------- */

  _drawLines(v,color){
    const gl=this.gl,buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aPos,3,gl.FLOAT,false,0,0);
    gl.uniform4fv(this.uColor,color);
    gl.drawArrays(gl.LINES,0,v.length/3);
    gl.deleteBuffer(buf);
  }

  /* ---------- GRID ------------------------------------------------------- */

  _drawGrid(){
    const s=this.gridSize,st=this.gridStep;
    const lines=[];                        // обычные клетки
    const axes =[];                        // центральные оси

    for(let i=-s;i<=s;i+=st){
      // X-параллельные (по Z)
      (i===0?axes:lines).push(-s,0,i, s,0,i);
      // Z-параллельные (по X)
      (i===0?axes:lines).push(i,0,-s, i,0, s);
    }
    /* обычная сетка */
    this.gl.uniformMatrix4fv(this.uModel,false,mat4.create());
    this._drawLines(new Float32Array(lines),[0.45,0.45,0.45,1]);

    /* центральные оси ярче */
    this._drawLines(new Float32Array(axes),
                    [0.9,0.2,0.2,1]); // красный / тёмно-синий, чтобы
  }

  /* ---------- GIZMO ------------------------------------------------------ */

  _drawGizmo(){
    const len=1.2;
    const v=new Float32Array([
      0,0,0, len,0,0,  0,0,0, 0,len,0,   0,0,0, 0,0,len
    ]);
    /* ортографию под гизмo */
    const proj=mat4.create();mat4.ortho(proj,0,50,0,50,-10,10);
    const view=mat4.create();
    const model=mat4.create();mat4.translate(model,model,[8,8,0]);

    this.gl.uniformMatrix4fv(this.uProj,false,proj);
    this.gl.uniformMatrix4fv(this.uView,false,view);
    this.gl.uniformMatrix4fv(this.uModel,false,model);

    this._drawLines(v.subarray(0,2*3), [1,0,0,1]); // X
    this._drawLines(v.subarray(2*3,4*3),[0,1,0,1]); // Y
    this._drawLines(v.subarray(4*3),    [0,0,1,1]); // Z

    this._setupProjection(); // вернём перспективу
  }

  /* ---------- основной рендер-проход ------------------------------------ */

  clear(){this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);}
  render(scene,debug=false){
    this.clear();

    /* camera view */
    const eye=[
      Math.cos(this.camYaw)*Math.cos(this.camPitch)*this.camDist,
      Math.sin(this.camPitch)*this.camDist,
      Math.sin(this.camYaw)*Math.cos(this.camPitch)*this.camDist
    ];
    const view=mat4.create();
    mat4.lookAt(view,eye,[0,0,0],[0,1,0]);
    this.gl.uniformMatrix4fv(this.uView,false,view);

    if(debug) this._drawGrid();

    scene.objects.forEach(o=>{
      if(typeof o.renderWebGL3D==='function')
        o.renderWebGL3D(this.gl,this.shaderProgram,this.uModel);
    });

    if(debug) this._drawGizmo();
  }
}
