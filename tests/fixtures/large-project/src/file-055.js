// File 55
// TEMPLATE_ONLY_START
function templateOnlyFunction55() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction55() {
  return 'production-55';
}

// @template-only
const templateVar55 = 'should be removed';

module.exports = {
  productionFunction55
};
