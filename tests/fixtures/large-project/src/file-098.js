// File 98
// TEMPLATE_ONLY_START
function templateOnlyFunction98() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction98() {
  return 'production-98';
}

// @template-only
const templateVar98 = 'should be removed';

module.exports = {
  productionFunction98
};
