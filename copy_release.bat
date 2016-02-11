SET TRG=arm-uptime-release

pushd ..\\%TRG%
git rm -r app
git rm -r components
popd

pushd dist\\public
cp -R app ../../../%TRG%
cp -R components ../../../%TRG%
cp -R bower_components ../../../%TRG%
cp index.html ../../../%TRG%
popd
