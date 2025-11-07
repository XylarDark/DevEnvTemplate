// File 5
// TEMPLATE_ONLY_START
function templateOnlyFunction5() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction5() {
  return 'production-5';
}

// @template-only
const templateVar5 = 'should be removed';

module.exports = {
  productionFunction5
};
