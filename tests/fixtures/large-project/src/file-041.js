// File 41
// TEMPLATE_ONLY_START
function templateOnlyFunction41() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction41() {
  return 'production-41';
}

// @template-only
const templateVar41 = 'should be removed';

module.exports = {
  productionFunction41
};
