SET TRG=arm-uptime-release

pushd ..\\%TRG%
git rm -r app
git rm index.html
popd

pushd dist\\public
cp -R app ../../../%TRG%
cp index.html ../../../%TRG%
popd
