// File 8
// TEMPLATE_ONLY_START
function templateOnlyFunction8() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction8() {
  return 'production-8';
}

// @template-only
const templateVar8 = 'should be removed';

module.exports = {
  productionFunction8
};
