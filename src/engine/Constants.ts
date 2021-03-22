/**
 * shader 中属性的位置
 */
export namespace SHADER_LOC {
  export const VERTEX: number = 0; // vertex
}

export namespace SHADER_VAR_NAME {
  export const MAT_MODEL = "modelMatrix"; // 模型矩阵
  export const MAT_PROJECT = "projectMatrix"; // 投影矩阵
  export const TEX_0 = "texture_0"; // 0号纹理

  export namespace SPRITE {
    export const COLOR = "spriteColor";
  }
}

export namespace SHADER {
  export const VERTEX_SPRITE = `#version 300 es

precision mediump float;

layout (location = 0) in vec4 vertex; // <vec2 position, vec2 texCoords>

out vec2 TexCoords;

uniform mat4 modelMatrix;
uniform mat4 projectMatrix;

void main()
{
    TexCoords = vertex.zw;
    gl_Position = projectMatrix * modelMatrix * vec4(vertex.xy, 0.0, 1.0);
}
  `;

  export const FRAGMENT_SPRITE = `#version 300 es

precision mediump float;

in vec2 TexCoords;
out vec4 color;

uniform sampler2D texture_0;
uniform vec3 spriteColor;

void main()
{
    vec4 tColor = texture(texture_0, TexCoords);
    if (tColor.a < 0.01) discard;

    color = vec4(spriteColor, 1.0) * tColor;
}
  `;
}
