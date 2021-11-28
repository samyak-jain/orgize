use std::borrow::Cow;

use nom::{
    bytes::complete::{tag, take_till},
    combinator::opt,
    sequence::{delimited, preceded},
    IResult,
};

/// Inline Babel Call Object
#[cfg_attr(feature = "ser", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Default, Clone, PartialEq)]
pub struct InlineCall<'a> {
    /// Called code block name
    pub name: Cow<'a, str>,
    /// Header arguments applied to the code block
    #[cfg_attr(feature = "ser", serde(skip))]
    pub inside_header: Option<Cow<'a, str>>,
    /// Argument passed to the code block
    pub arguments: Cow<'a, str>,
    /// Header arguments applied to the calling instance
    #[cfg_attr(feature = "ser", serde(skip))]
    pub end_header: Option<Cow<'a, str>>,
}

impl InlineCall<'_> {
    pub(crate) fn parse(input: &str) -> Option<(&str, InlineCall)> {
        parse_internal(input).ok()
    }

    pub fn into_owned(self) -> InlineCall<'static> {
        InlineCall {
            name: self.name.into_owned().into(),
            arguments: self.arguments.into_owned().into(),
            inside_header: self.inside_header.map(Into::into).map(Cow::Owned),
            end_header: self.end_header.map(Into::into).map(Cow::Owned),
        }
    }
}

#[inline]
fn parse_internal(input: &str) -> IResult<&str, InlineCall, ()> {
    let (input, name) = preceded(
        tag("call_"),
        take_till(|c| c == '[' || c == '\n' || c == '(' || c == ')'),
    )(input)?;
    let (input, inside_header) = opt(delimited(
        tag("["),
        take_till(|c| c == ']' || c == '\n'),
        tag("]"),
    ))(input)?;
    let (input, arguments) =
        delimited(tag("("), take_till(|c| c == ')' || c == '\n'), tag(")"))(input)?;
    let (input, end_header) = opt(delimited(
        tag("["),
        take_till(|c| c == ']' || c == '\n'),
        tag("]"),
    ))(input)?;

    Ok((
        input,
        InlineCall {
            name: name.into(),
            arguments: arguments.into(),
            inside_header: inside_header.map(Into::into),
            end_header: end_header.map(Into::into),
        },
    ))
}

#[test]
fn parse() {
    assert_eq!(
        InlineCall::parse("call_square(4)"),
        Some((
            "",
            InlineCall {
                name: "square".into(),
                arguments: "4".into(),
                inside_header: None,
                end_header: None,
            }
        ))
    );
    assert_eq!(
        InlineCall::parse("call_square[:results output](4)"),
        Some((
            "",
            InlineCall {
                name: "square".into(),
                arguments: "4".into(),
                inside_header: Some(":results output".into()),
                end_header: None,
            },
        ))
    );
    assert_eq!(
        InlineCall::parse("call_square(4)[:results html]"),
        Some((
            "",
            InlineCall {
                name: "square".into(),
                arguments: "4".into(),
                inside_header: None,
                end_header: Some(":results html".into()),
            },
        ))
    );
    assert_eq!(
        InlineCall::parse("call_square[:results output](4)[:results html]"),
        Some((
            "",
            InlineCall {
                name: "square".into(),
                arguments: "4".into(),
                inside_header: Some(":results output".into()),
                end_header: Some(":results html".into()),
            },
        ))
    );
}
