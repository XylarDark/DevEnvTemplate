// File 97
// TEMPLATE_ONLY_START
function templateOnlyFunction97() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction97() {
  return 'production-97';
}

// @template-only
const templateVar97 = 'should be removed';

module.exports = {
  productionFunction97
};
