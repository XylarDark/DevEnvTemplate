// File 27
// TEMPLATE_ONLY_START
function templateOnlyFunction27() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction27() {
  return 'production-27';
}

// @template-only
const templateVar27 = 'should be removed';

module.exports = {
  productionFunction27
};
