import * as THREE from 'three'

export default class ProjectedMaterial extends THREE.ShaderMaterial {
  constructor({ camera, texture, color = 0xffffff, ...options }) {
    if (!texture || !texture.isTexture) {
      throw new Error('Invalid texture passed to the ProjectedMaterial')
    }

    if (!camera || !camera.isCamera) {
      throw new Error('Invalid camera passed to the ProjectedMaterial')
    }

    // make sure the camera matrices are updated
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    camera.updateWorldMatrix()

    // get the matrices from the camera so they're fixed in camera's original position
    // 从相机获取矩阵，以便将它们固定在相机的原始位置
    // 观察矩阵(视点矩阵)
    const viewMatrixCamera = camera.matrixWorldInverse.clone()
    // 投影矩阵
    const projectionMatrixCamera = camera.projectionMatrix.clone()
    // 模型矩阵
    const modelMatrixCamera = camera.matrixWorld.clone()
    const projPosition = camera.position.clone()
    console.error(modelMatrixCamera, projPosition)

    super({
      ...options,
      uniforms: {
        color: { value: new THREE.Color(color) },
        texture: { value: texture },
        viewMatrixCamera: { type: 'm4', value: viewMatrixCamera },
        projectionMatrixCamera: { type: 'm4', value: projectionMatrixCamera },
        modelMatrixCamera: { type: 'mat4', value: modelMatrixCamera },
        projPosition: { type: 'v3', value: projPosition },
      },

      vertexShader: `
          uniform mat4 viewMatrixCamera;
          uniform mat4 projectionMatrixCamera;
          uniform mat4 modelMatrixCamera;

          varying vec4 vWorldPosition;
          varying vec3 vNormal;
          varying vec4 vTexCoords;


          void main() {
            // in: modelMatrix,模型的世界坐标矩阵
            // in: normal,顶点法向量
            // out: 模型法线向量
            vNormal = mat3(modelMatrix) * normal;

            // in: position,顶点局部坐标
            // in: modelMatrix,模型的世界坐标矩阵
            // out: vWorldPosition,模型世界坐标
            vWorldPosition = modelMatrix * vec4(position, 1.0);

            // in: projectionMatrixCamera,相机的投影矩阵
            // in: viewMatrixCamera,视图模型矩阵
            // in: position,顶点局部坐标
            // out: vTexCoords,模型在相机上的投影
            vTexCoords = projectionMatrixCamera * viewMatrixCamera * vWorldPosition;

            // 相机的位置
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,

      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D texture;
        uniform vec3 projPosition;

        varying vec3 vNormal;
        varying vec4 vWorldPosition;
        varying vec4 vTexCoords;

        void main() {
          // 从世界空间转换为剪辑空间,将向量除以其.w分量来实现
          vec2 uv = vTexCoords.xy / vTexCoords.w;


          // 从剪裁空间[-1, 1]转换为uv查找范围（即）[0, 1]
          uv = uv * 0.5 + 0.5;

          // 纹理采样,投影坐标作为纹理采样坐标
          vec4 outColor = texture2D(texture, uv);

          // 这可以确保我们不在对象的背面也渲染纹理
          vec3 projectorDirection = normalize(projPosition - vWorldPosition.xyz);
          // 通过查看法线和相机方向的点积来检查人眼是否真的朝向相机
          float dotProduct = dot(vNormal, projectorDirection);
          if (dotProduct < 0.0) {
            outColor = vec4(color, 1.0);
          }

          gl_FragColor = outColor;
        }
      `,
    })

    this.isProjectedMaterial = true
  }
}
