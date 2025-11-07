// File 111
// TEMPLATE_ONLY_START
function templateOnlyFunction111() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction111() {
  return 'production-111';
}

// @template-only
const templateVar111 = 'should be removed';

module.exports = {
  productionFunction111
};
