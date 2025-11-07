// File 10
// TEMPLATE_ONLY_START
function templateOnlyFunction10() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction10() {
  return 'production-10';
}

// @template-only
const templateVar10 = 'should be removed';

module.exports = {
  productionFunction10
};
