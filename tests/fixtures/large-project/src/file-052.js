// File 52
// TEMPLATE_ONLY_START
function templateOnlyFunction52() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction52() {
  return 'production-52';
}

// @template-only
const templateVar52 = 'should be removed';

module.exports = {
  productionFunction52
};
