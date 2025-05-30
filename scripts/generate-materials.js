// scripts/generate-materials.js
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const MATERIALS_DIR = path.resolve(__dirname, '../src/assets/materials');

/**
 * Найти файл в папке по подстроке и расширению
 */
function findFileBySubstring(files, substr, ext) {
  substr = substr.toLowerCase();
  return files.find(f =>
    f.toLowerCase().includes(substr) && f.toLowerCase().endsWith(ext)
  );
}

/**
 * Гибко ищет карту в XML-узлах по подстроке
 */
function findTiledImageFile(mat, substr) {
  const img = (mat.tiledimage || []).find(img =>
    img.$.name.toLowerCase().includes(substr.toLowerCase())
  );
  if (!img) return undefined;
  const input = img.input.find(i => i.$.name === 'file');
  return input ? input.$.value : undefined;
}

function parseMaterial(mtlxPath, folder) {
  const xml = fs.readFileSync(mtlxPath, 'utf8');
  xml2js.parseString(xml, (err, result) => {
    if (err) {
      console.error(`Ошибка парсинга: ${mtlxPath}`);
      return;
    }
    const mat = result.materialx;
    const matSurf = mat.standard_surface?.[0];
    if (!matSurf) {
      console.error(`Нет standard_surface в ${mtlxPath}`);
      return;
    }

    const name = path.basename(folder);

    // Ищем все текстуры по частям имени
    const colorMap        = findTiledImageFile(mat, 'color');
    const normalMap       = findTiledImageFile(mat, 'normal');
    const roughnessMap    = findTiledImageFile(mat, 'roughness');
    const metalnessMap    = findTiledImageFile(mat, 'metalness');
    const displacementMap = findTiledImageFile(mat, 'displacement');

    // Параметры
    const roughnessInput = matSurf.input.find(i => i.$.name === 'specular_roughness');
    const metalnessInput = matSurf.input.find(i => i.$.name === 'metalness');
    const roughness = roughnessInput?.$.value ? parseFloat(roughnessInput.$.value) : null;
    const metalness = metalnessInput?.$.value ? parseFloat(metalnessInput.$.value) : null;

    // Найдём файлы .mtlx и .usdc
    const files = fs.readdirSync(folder);
    const mtlx = findFileBySubstring(files, '', '.mtlx') || '';
    const usdc = findFileBySubstring(files, '', '.usdc') || '';

    // Если превью есть — используем colorMap (обычно оно самое наглядное)
    const materialJSON = {
      name,
      type: "material",
      preview: colorMap || '', // просто первое что нашли
      colorMap,
      normalMap,
      roughnessMap,
      metalnessMap,
      displacementMap,
      mtlx,
      usdc,
      parameters: {}
    };
    if (roughness !== null) materialJSON.parameters.roughness = roughness;
    if (metalness !== null) materialJSON.parameters.metalness = metalness;

    // Сохраняем JSON рядом с материалом
    const jsonPath = path.join(folder, 'material.json');
    fs.writeFileSync(jsonPath, JSON.stringify(materialJSON, null, 2));
    console.log(`✔️  material.json создан: ${jsonPath}`);
  });
}

// Сканируем все подпапки materials/
fs.readdirSync(MATERIALS_DIR, { withFileTypes: true }).forEach(dir => {
  if (dir.isDirectory()) {
    const folder = path.join(MATERIALS_DIR, dir.name);
    const files = fs.readdirSync(folder);
    const mtlx = files.find(f => f.endsWith('.mtlx'));
    if (mtlx) {
      parseMaterial(path.join(folder, mtlx), folder);
    }
  }
});
