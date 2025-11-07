// File 21
// TEMPLATE_ONLY_START
function templateOnlyFunction21() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction21() {
  return 'production-21';
}

// @template-only
const templateVar21 = 'should be removed';

module.exports = {
  productionFunction21
};
