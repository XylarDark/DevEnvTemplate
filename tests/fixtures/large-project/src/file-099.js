// File 99
// TEMPLATE_ONLY_START
function templateOnlyFunction99() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction99() {
  return 'production-99';
}

// @template-only
const templateVar99 = 'should be removed';

module.exports = {
  productionFunction99
};
