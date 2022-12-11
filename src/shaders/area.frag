#version 300 es
precision highp float;

// Adapted from OBS Source code
// https://github.com/obsproject/obs-studio/blob/0729007f19f7bda9e9fb94b5cf5ed1d232e0792c/libobs/data/area.effect#L98

in vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uSampler;
uniform vec2  uBaseDimension;
uniform vec2  uBaseDimensionI;

void main(void) {
  vec2 uv = vTextureCoord;
  vec2 uv_delta = vec2(dFdx(uv.x), dFdy(uv.y));

  vec2 uv_min = uv - 0.5 * uv_delta;
  vec2 uv_max = uv_min + uv_delta;

  vec2 load_index_first = floor(uv_min * uBaseDimension);
  vec2 load_index_last = ceil(uv_max * uBaseDimension) - 1.0;

  if (load_index_first.x < load_index_last.x) {
    float uv_boundary_x = load_index_last.x * uBaseDimensionI.x;
    uv.x = ((uv.x - uv_boundary_x) / uv_delta.x) * uBaseDimensionI.x + uv_boundary_x;
  } else {
    uv.x = (load_index_first.x + 0.5) * uBaseDimensionI.x;
  }
  if (load_index_first.y < load_index_last.y) {
    float uv_boundary_y = load_index_last.y * uBaseDimensionI.y;
    uv.y = ((uv.y - uv_boundary_y) / uv_delta.y) * uBaseDimensionI.y + uv_boundary_y;
  } else {
    uv.y = (load_index_first.y + 0.5) * uBaseDimensionI.y;
  }

  fragColor =  texture(uSampler, uv);
}
