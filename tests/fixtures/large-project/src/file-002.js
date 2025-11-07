// File 2
// TEMPLATE_ONLY_START
function templateOnlyFunction2() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction2() {
  return 'production-2';
}

// @template-only
const templateVar2 = 'should be removed';

module.exports = {
  productionFunction2
};
