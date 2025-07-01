function catchAsync(fn) {
  return (req, res, next) => {
    // zasto next(err) a ne next(new AppError('message',400))
    // jer nije operational error, to jest samo programatic error ce biti prosledjen u next(err);
    fn(req, res, next).catch((err) => next(err));
  };
}
module.exports = catchAsync;
