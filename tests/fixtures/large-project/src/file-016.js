// File 16
// TEMPLATE_ONLY_START
function templateOnlyFunction16() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction16() {
  return 'production-16';
}

// @template-only
const templateVar16 = 'should be removed';

module.exports = {
  productionFunction16
};
