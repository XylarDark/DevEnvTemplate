// File 9
// TEMPLATE_ONLY_START
function templateOnlyFunction9() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction9() {
  return 'production-9';
}

// @template-only
const templateVar9 = 'should be removed';

module.exports = {
  productionFunction9
};
