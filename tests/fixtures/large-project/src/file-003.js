// File 3
// TEMPLATE_ONLY_START
function templateOnlyFunction3() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction3() {
  return 'production-3';
}

// @template-only
const templateVar3 = 'should be removed';

module.exports = {
  productionFunction3
};
