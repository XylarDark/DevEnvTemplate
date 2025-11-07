// File 17
// TEMPLATE_ONLY_START
function templateOnlyFunction17() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction17() {
  return 'production-17';
}

// @template-only
const templateVar17 = 'should be removed';

module.exports = {
  productionFunction17
};
