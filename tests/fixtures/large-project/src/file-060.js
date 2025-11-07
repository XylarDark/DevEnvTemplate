// File 60
// TEMPLATE_ONLY_START
function templateOnlyFunction60() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction60() {
  return 'production-60';
}

// @template-only
const templateVar60 = 'should be removed';

module.exports = {
  productionFunction60
};
