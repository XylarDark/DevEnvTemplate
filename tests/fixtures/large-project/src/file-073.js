// File 73
// TEMPLATE_ONLY_START
function templateOnlyFunction73() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction73() {
  return 'production-73';
}

// @template-only
const templateVar73 = 'should be removed';

module.exports = {
  productionFunction73
};
