// File 28
// TEMPLATE_ONLY_START
function templateOnlyFunction28() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction28() {
  return 'production-28';
}

// @template-only
const templateVar28 = 'should be removed';

module.exports = {
  productionFunction28
};
