// File 15
// TEMPLATE_ONLY_START
function templateOnlyFunction15() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction15() {
  return 'production-15';
}

// @template-only
const templateVar15 = 'should be removed';

module.exports = {
  productionFunction15
};
