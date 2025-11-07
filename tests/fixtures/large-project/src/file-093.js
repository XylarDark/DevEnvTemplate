// File 93
// TEMPLATE_ONLY_START
function templateOnlyFunction93() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction93() {
  return 'production-93';
}

// @template-only
const templateVar93 = 'should be removed';

module.exports = {
  productionFunction93
};
