// File 80
// TEMPLATE_ONLY_START
function templateOnlyFunction80() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction80() {
  return 'production-80';
}

// @template-only
const templateVar80 = 'should be removed';

module.exports = {
  productionFunction80
};
