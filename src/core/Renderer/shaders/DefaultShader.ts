/* ------------------------------------------------------------------
   ЕДИНСТВЕННОЕ содержание файла – сырой текст вершинного и
   фрагментного шейдера.  Ни логики, ни compile‑функций здесь нет.
   ------------------------------------------------------------------ */

   export const vertexShaderSrc = /* glsl */ `
   attribute vec3 aVertexPosition;
   attribute vec3 aVertexNormal;
   attribute vec2 aTexCoord;
   
   uniform mat4 uModel, uView, uProjection, uLightVP;
   uniform mat3 uNormalMatrix;
   
   varying vec4 vShadowPos;
   varying vec3 vNormal;
   varying vec3 vFragPos;
   varying vec2 vTexCoord;
   
   void main () {
     vec4 worldPos   = uModel * vec4(aVertexPosition, 1.0);
     vFragPos        = worldPos.xyz;
     vNormal         = normalize(uNormalMatrix * aVertexNormal);
     vTexCoord       = aTexCoord;
     vShadowPos      = uLightVP * worldPos;
     gl_Position     = uProjection * uView * worldPos;
   }
   `;
   
   export const fragmentShaderSrc = /* glsl */ `
        precision mediump float;

        #define MAX_LIGHTS 16

        varying vec3 vNormal;
        varying vec3 vFragPos;
        varying vec2 vTexCoord;
        varying vec4 vShadowPos;

        uniform sampler2D uTexture;
        uniform bool      uUseTexture;

        uniform vec3  uViewPos;
        uniform vec3  uSpecularColor;
        uniform float uShininess;

        uniform sampler2D uShadowTex;

        uniform int   uLightCount;
        uniform vec3  uLightPositions[MAX_LIGHTS];
        uniform vec3  uLightColors[MAX_LIGHTS]; // ← можно добавить поддержку цвета

        void main () {
        vec3 norm    = normalize(vNormal);
        vec3 viewDir = normalize(uViewPos - vFragPos);

        vec4 texColor = uUseTexture
                        ? texture2D(uTexture, vTexCoord)
                        : vec4(1.0);  // ← белый, умножается на lightColor

        // ------- Shadow (от первого источника) -------
        float visibility = 1.0;
        vec3  proj = vShadowPos.xyz / vShadowPos.w;
        proj = proj * 0.5 + 0.5;
        float closest = texture2D(uShadowTex, proj.xy).r;
        if (proj.z - 0.005 > closest) visibility = 0.4;

        // ------- Accumulated Lighting -------
        vec3 ambient = vec3(0.1);
        vec3 diffuse = vec3(0.0);
        vec3 specular = vec3(0.0);

        for (int i = 0; i < MAX_LIGHTS; i++) {
            if (i >= uLightCount) break;

            vec3 lightDir = normalize(uLightPositions[i] - vFragPos);
            float diff = max(dot(norm, lightDir), 0.0);

            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);

            diffuse  += diff * uLightColors[i];
            specular += spec * uSpecularColor * uLightColors[i];
        }

        vec3 finalColor = (ambient + visibility * diffuse) * texColor.rgb
                        + visibility * specular;

        gl_FragColor = vec4(finalColor, texColor.a);
        }
   `;
   