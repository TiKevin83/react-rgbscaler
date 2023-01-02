#version 300 es
precision highp float;

in vec2		vTextureCoord;
out vec4 fragColor;

uniform sampler2D uSampler;
// Emulated input resolution.
uniform vec2  uBaseDimension;
uniform vec2  uBaseDimensionI;

uniform float maskIntensity;
uniform float scanlineIntensity;

// Area affect from OBS source https://github.com/obsproject/obs-studio/blob/29782cd594be2a5dc52fc79fa20bd0468648c6c5/libobs/data/area.effect#L127
vec2 Area() {
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

  return uv;
}

vec3 Mask()
{
  float horizontalDistanceIntoPixel = fract(vTextureCoord.x*uBaseDimension.x);
  return vec3(
    1.0-min(maskIntensity*6.0*min(abs(1.0/6.0 - horizontalDistanceIntoPixel), 1.0/6.0), 1.0),
    1.0-min(maskIntensity*6.0*min(abs(3.0/6.0 - horizontalDistanceIntoPixel), 1.0/6.0), 1.0),
    1.0-min(maskIntensity*6.0*min(abs(5.0/6.0 - horizontalDistanceIntoPixel), 1.0/6.0), 1.0)
  );
}

vec3 Scanlines()
{
  float verticalDistanceIntoPixel = fract(vTextureCoord.y*uBaseDimension.y);
  float intensity = 1.0-min(scanlineIntensity*2.0*min(abs(0.5 - verticalDistanceIntoPixel), 0.5), 1.0);
  return vec3(
    intensity,
    intensity,
    intensity
  );
}

void main()
{
  vec3 temp = texture(uSampler,Area()).rgb*Mask()*Scanlines();
  fragColor = vec4(temp.r, temp.g, temp.b, 1.0);
}
