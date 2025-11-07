// File 13
// TEMPLATE_ONLY_START
function templateOnlyFunction13() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction13() {
  return 'production-13';
}

// @template-only
const templateVar13 = 'should be removed';

module.exports = {
  productionFunction13
};
