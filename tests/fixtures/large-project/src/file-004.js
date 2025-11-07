// File 4
// TEMPLATE_ONLY_START
function templateOnlyFunction4() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction4() {
  return 'production-4';
}

// @template-only
const templateVar4 = 'should be removed';

module.exports = {
  productionFunction4
};
