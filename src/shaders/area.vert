#version 300 es
precision highp float;

in vec4 aVertexPosition;
in vec2 aTextureCoord;

out highp vec2 vTextureCoord;

void main(void) {
  gl_Position = aVertexPosition;
  vTextureCoord = aTextureCoord;
}
