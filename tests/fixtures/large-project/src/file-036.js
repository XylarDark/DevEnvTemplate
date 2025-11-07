// File 36
// TEMPLATE_ONLY_START
function templateOnlyFunction36() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction36() {
  return 'production-36';
}

// @template-only
const templateVar36 = 'should be removed';

module.exports = {
  productionFunction36
};
