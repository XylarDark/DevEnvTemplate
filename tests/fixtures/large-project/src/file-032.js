// File 32
// TEMPLATE_ONLY_START
function templateOnlyFunction32() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction32() {
  return 'production-32';
}

// @template-only
const templateVar32 = 'should be removed';

module.exports = {
  productionFunction32
};
