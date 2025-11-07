// File 25
// TEMPLATE_ONLY_START
function templateOnlyFunction25() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction25() {
  return 'production-25';
}

// @template-only
const templateVar25 = 'should be removed';

module.exports = {
  productionFunction25
};
