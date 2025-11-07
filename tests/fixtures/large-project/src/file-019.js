// File 19
// TEMPLATE_ONLY_START
function templateOnlyFunction19() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction19() {
  return 'production-19';
}

// @template-only
const templateVar19 = 'should be removed';

module.exports = {
  productionFunction19
};
