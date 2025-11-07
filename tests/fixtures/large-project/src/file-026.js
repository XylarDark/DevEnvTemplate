// File 26
// TEMPLATE_ONLY_START
function templateOnlyFunction26() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction26() {
  return 'production-26';
}

// @template-only
const templateVar26 = 'should be removed';

module.exports = {
  productionFunction26
};
