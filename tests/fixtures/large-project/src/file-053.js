// File 53
// TEMPLATE_ONLY_START
function templateOnlyFunction53() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction53() {
  return 'production-53';
}

// @template-only
const templateVar53 = 'should be removed';

module.exports = {
  productionFunction53
};
