// File 95
// TEMPLATE_ONLY_START
function templateOnlyFunction95() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction95() {
  return 'production-95';
}

// @template-only
const templateVar95 = 'should be removed';

module.exports = {
  productionFunction95
};
