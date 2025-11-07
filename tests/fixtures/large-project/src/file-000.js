// File 0
// TEMPLATE_ONLY_START
function templateOnlyFunction0() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction0() {
  return 'production-0';
}

// @template-only
const templateVar0 = 'should be removed';

module.exports = {
  productionFunction0
};
