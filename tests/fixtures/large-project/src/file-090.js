// File 90
// TEMPLATE_ONLY_START
function templateOnlyFunction90() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction90() {
  return 'production-90';
}

// @template-only
const templateVar90 = 'should be removed';

module.exports = {
  productionFunction90
};
