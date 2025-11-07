// File 12
// TEMPLATE_ONLY_START
function templateOnlyFunction12() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction12() {
  return 'production-12';
}

// @template-only
const templateVar12 = 'should be removed';

module.exports = {
  productionFunction12
};
