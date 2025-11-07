// File 7
// TEMPLATE_ONLY_START
function templateOnlyFunction7() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction7() {
  return 'production-7';
}

// @template-only
const templateVar7 = 'should be removed';

module.exports = {
  productionFunction7
};
