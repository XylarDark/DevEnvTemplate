// File 1
// TEMPLATE_ONLY_START
function templateOnlyFunction1() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction1() {
  return 'production-1';
}

// @template-only
const templateVar1 = 'should be removed';

module.exports = {
  productionFunction1
};
