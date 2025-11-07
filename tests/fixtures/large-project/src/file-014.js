// File 14
// TEMPLATE_ONLY_START
function templateOnlyFunction14() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction14() {
  return 'production-14';
}

// @template-only
const templateVar14 = 'should be removed';

module.exports = {
  productionFunction14
};
