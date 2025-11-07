// File 108
// TEMPLATE_ONLY_START
function templateOnlyFunction108() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction108() {
  return 'production-108';
}

// @template-only
const templateVar108 = 'should be removed';

module.exports = {
  productionFunction108
};
