// File 6
// TEMPLATE_ONLY_START
function templateOnlyFunction6() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction6() {
  return 'production-6';
}

// @template-only
const templateVar6 = 'should be removed';

module.exports = {
  productionFunction6
};
